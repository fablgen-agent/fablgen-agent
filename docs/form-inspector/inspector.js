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
    return { forms: openings.length, findings };
  }

  return { inspectHtml };
}));
