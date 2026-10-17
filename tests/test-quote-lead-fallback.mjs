import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {quoteMessage,quoteFallback,verifiedWhatsApp,verifiedMailto} from '../assets/js/quote-lead-fallback.js';
const html=String.raw`<!doctype html><form class="quote-form">
<input name="nome" value="Cliente">
<input name="email" value="customer@example.com">
<input name="progetto" value="Incisione targa 20 pezzi">
<input name="token" value="DO_NOT_LEAK">
<input name="_subject" value="system-hidden">
<input name="richiesta" value="<script>alert(1)</script>">
<input name="vuoto" value="">
<button type="submit">Richiedi preventivo</button>
</form>`;
const dom=new JSDOM(html,{url:'https://inglyum.github.io/website-ingly-xtool/',pretendToBeVisual:true});
const form=dom.window.document.querySelector('form');
const raw=quoteMessage(form,{business:true,language:'it'});
assert.match(raw,/Azienda/);
assert.match(raw,/Incisione targa 20 pezzi/);
assert.doesNotMatch(raw,/DO_NOT_LEAK|_subject|token/);
const wa=verifiedWhatsApp('https://wa.me/393296904627',raw);
assert.ok(wa.startsWith('https://wa.me/393296904627?text='));
assert.equal(new URL(wa).searchParams.get('text'),raw);
for(const unsafe of ['http://wa.me/393296904627','https://wa.me.evil.org/123456789','https://evil.org/x',
 'javascript:alert(1)','https://wa.me/abc','https://wa.me/12345','https://user:secret@wa.me/393296904627'])
 assert.equal(verifiedWhatsApp(unsafe,raw),'','Reject unsafe contact '+unsafe);
assert.ok(verifiedMailto('valid@example.com',raw).startsWith('mailto:valid@example.com?'));
assert.equal(verifiedMailto('notanemail',raw),'');
assert.equal(quoteFallback(form,{whatsapp:'https://wa.me/393296904627'},{
  business:true,language:'it'
}),true);
const banner=form.querySelector('[data-ingly-quote-fallback]');
assert.ok(banner);
assert.match(banner.textContent,/Non abbiamo ancora ricevuto la richiesta/);
assert.equal(banner.querySelectorAll('a').length,1);
assert.match(banner.querySelector('a').textContent,/Continua su WhatsApp/);
assert.equal(banner.querySelector('a').target,'_blank');
assert.equal(banner.querySelector('script'),null,'No HTML parsing of user data');
assert.equal(form.querySelector('[name=nome]').value,'Cliente','Form stays intact if no backend');
assert.equal(quoteFallback(form,{email:'info@example.com'},{
  business:false,language:'en'
}),true);
assert.equal(form.querySelectorAll('[data-ingly-quote-fallback]').length,1,'Reused rather than duplicated');
assert.ok(form.querySelector('[data-ingly-quote-fallback] a').href.startsWith('mailto:info@example.com'));
assert.equal(quoteFallback(form,{},{}),false);
assert.match(form.querySelector('[data-ingly-quote-fallback]').textContent,/Nessun recapito valido/);
const forms=readFileSync('assets/js/forms.js','utf8');
assert.match(forms,/quoteFallback\(form,CONFIG/,'Form must call fallback on endpoint unavailability or network failure');
assert.match(forms,/\{quote:true,business:azienda\}/,'Quote form must opt in to fallback');
assert.match(forms,/if\(options\.quote\)/,'Newsletter must not be silently sent by WhatsApp');
const config=JSON.parse(readFileSync('data/config.json','utf8'));
assert.equal(config.moduli.formspreePreventivo,'','Missing backend is a real production scenario');
assert.ok(verifiedWhatsApp(config.whatsapp,'test'),'Live configured contact can be used');
dom.window.close();
console.log('✔ Quotations: explicit, non-sending fallback for empty Formspree; no lost form draft or unsafe redirect');
