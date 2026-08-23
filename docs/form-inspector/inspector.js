(function publish(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.StaticFormInspector = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function createInspector() {
  'use strict';

  function lineAt(text, offset) {
    return text.slice(0, Math.max(0, offset)).split('\n').length;
  }

  function attribute(tag, name) {
    const expression = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
    const match = tag.match(expression);
    if (!match) return null;
    return match[1] ?? match[2] ?? match[3] ?? '';
  }

  function hasAttribute(tag, name) {
    return new RegExp(`\\b${name}(?:\\s*=|\\s|/?>)`, 'i').test(tag);
  }

  function makeFinding(document, offset, severity, rule, message) {
    return { line: lineAt(document, offset), severity, rule, message };
  }

  function hasVisibleSuccessSignal(source) {
    const successCopy = /(?:thank\s+you|successfully\s+(?:sent|submitted|received)|message\s+(?:sent|received)|(?:form|enquiry|inquiry|request)\s+(?:submitted|received))/i;
    const uiMutation = /(?:textContent|innerText|innerHTML|classList\s*\.|style\s*\.|\.reset\s*\(|setAttribute\s*\()/i;
    return successCopy.test(source) && uiMutation.test(source);
  }

  function hasDeliveryCall(source) {
    return /(?:\bfetch\s*\(|\baxios\s*\.|\bXMLHttpRequest\b|\.ajax\s*\(|\bsendBeacon\s*\(|\bemailjs\s*\.|\.submit\s*\(|\brequestSubmit\s*\()/i.test(source);
  }

  function matchingParenthesis(source, opening) {
    let depth = 0;
    let quote = null;
    let escaped = false;
    let lineComment = false;
    let blockComment = false;

    for (let index = opening; index < source.length; index += 1) {
      const character = source[index];
      const next = source[index + 1];
      if (lineComment) {
        if (character === '\n') lineComment = false;
        continue;
      }
      if (blockComment) {
        if (character === '*' && next === '/') {
          blockComment = false;
          index += 1;
        }
        continue;
      }
      if (quote) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === quote) quote = null;
        continue;
      }
      if (character === '/' && next === '/') {
        lineComment = true;
        index += 1;
        continue;
      }
      if (character === '/' && next === '*') {
        blockComment = true;
        index += 1;
        continue;
      }
      if (character === '"' || character === "'" || character === '`') {
        quote = character;
        continue;
      }
      if (character === '(') depth += 1;
      if (character === ')') {
        depth -= 1;
        if (depth === 0) return index;
      }
    }
    return -1;
  }

  function inspectCancelledSubmitHandlers(document) {
    const findings = [];
    const contactFormExists = [...document.matchAll(/<form\b[^>]*>[\s\S]*?<\/form\s*>/gi)]
      .some(match => /<textarea\b|<input\b[^>]*\btype\s*=\s*["']?(?:email|tel)["']?/i.test(match[0]));
    if (!contactFormExists) return findings;

    for (const opening of document.matchAll(/<form\b[^>]*>/gi)) {
      const handler = attribute(opening[0], 'onsubmit');
      if (!handler || !/(?:preventDefault\s*\(|return\s+false\b)/i.test(handler)) continue;
      if (hasVisibleSuccessSignal(handler) && !hasDeliveryCall(handler)) {
        findings.push(makeFinding(document, opening.index, 'warning', 'cancelled-submit-without-delivery', 'Inline submit handler cancels native submission and displays success without a visible delivery call. Confirm that the enquiry is actually sent.'));
      }
    }

    for (const script of document.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
      if (hasAttribute(script[1], 'src')) continue;
      const source = script[2];
      let cursor = 0;
      while (cursor < source.length) {
        const method = source.indexOf('.addEventListener', cursor);
        if (method === -1) break;
        const opening = source.indexOf('(', method);
        if (opening === -1) break;
        const closing = matchingParenthesis(source, opening);
        if (closing === -1) break;
        const call = source.slice(method, closing + 1);
        if (/^\.addEventListener\s*\(\s*["']submit["']\s*,/i.test(call)
          && /\.preventDefault\s*\(/i.test(call)
          && hasVisibleSuccessSignal(call)
          && !hasDeliveryCall(call)) {
          const offset = script.index + script[0].indexOf(script[2]) + method;
          findings.push(makeFinding(document, offset, 'warning', 'cancelled-submit-without-delivery', 'Inline submit listener cancels native submission and displays success without a visible delivery call. Confirm that the enquiry is actually sent.'));
        }
        cursor = closing + 1;
      }
    }
    return findings;
  }

  function inspectForm(document, formHtml, offset, closed) {
    const findings = [];
    const openTag = formHtml.match(/^<form\b[^>]*>/i)?.[0] || '<form>';
    const action = attribute(openTag, 'action');
    const method = (attribute(openTag, 'method') || 'get').toLowerCase();
    const hasContactField = /<textarea\b|<input\b[^>]*\btype\s*=\s*["']?(?:email|tel)["']?/i.test(formHtml);

    if (!closed) findings.push(makeFinding(document, offset, 'error', 'unclosed-form', 'Form has no closing </form> tag.'));
    if (action === null) {
      findings.push(makeFinding(document, offset, 'warning', 'missing-action', 'Form has no action. Confirm that JavaScript delivers the submission.'));
    } else if (!action.trim() || /^(?:#|javascript:)/i.test(action.trim())) {
      findings.push(makeFinding(document, offset, 'error', 'inert-action', `Form action is not a delivery endpoint: ${action || '(empty)'}.`));
    } else if (/^mailto:/i.test(action.trim())) {
      findings.push(makeFinding(document, offset, 'warning', 'mailto-action', 'mailto: depends on a configured mail application and is not reliable in-browser submission.'));
    }

    const placeholder = formHtml.match(/(?:YOUR_[A-Z0-9_]*(?:KEY|TOKEN)|REPLACE[_ -]?ME|["'](?:your|test)[-_ ]?(?:access[-_ ]?)?(?:key|token)["'])/i);
    if (placeholder) findings.push(makeFinding(document, offset + placeholder.index, 'error', 'placeholder-credential', 'Form contains a placeholder credential or endpoint token.'));
    if (hasContactField && method === 'get') findings.push(makeFinding(document, offset, 'warning', 'contact-form-get', 'Contact-like form defaults to GET; submitted values may appear in URLs and logs.'));

    for (const match of formHtml.matchAll(/<(input|select|textarea)\b[^>]*>/gi)) {
      const tag = match[0];
      const tagName = match[1].toLowerCase();
      const type = (attribute(tag, 'type') || 'text').toLowerCase();
      if (tagName === 'input' && ['button', 'submit', 'reset', 'image'].includes(type)) continue;
      if (hasAttribute(tag, 'disabled')) continue;
      if (!attribute(tag, 'name')) findings.push(makeFinding(document, offset + match.index, 'warning', 'missing-field-name', `${tagName} control has no name, so native form submission will omit its value.`));
    }
    return findings;
  }

  function inspectHtml(text) {
    const document = String(text || '');
    const findings = [];
    const openings = [...document.matchAll(/<form\b[^>]*>/gi)];
    for (const opening of openings) {
      const start = opening.index;
      const remainder = document.slice(start);
      const closing = /<\/form\s*>/i.exec(remainder);
      const end = closing ? start + closing.index + closing[0].length : document.length;
      findings.push(...inspectForm(document, document.slice(start, end), start, Boolean(closing)));
    }
    findings.push(...inspectCancelledSubmitHandlers(document));
    return { forms: openings.length, findings };
  }

  return { inspectHtml };
}));
