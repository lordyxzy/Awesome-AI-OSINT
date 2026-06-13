import { link, replyLong } from '../utils/format.js';

const GEOINT_PROMPT = `You are a GEOINT analyst. I will provide an image. Without guessing wildly, work step by step:
1. List every visible clue: language/script on signs, license plate format & colours, road markings, architecture, vegetation/climate, sun position & shadows, vehicles, utility poles, business names.
2. For each clue, state what region/country it points to and why.
3. Cross-reference the clues to narrow down country → region → city → candidate coordinates.
4. Give your top 3 ranked location hypotheses with confidence levels and the reasoning chain for each.
5. Suggest concrete verification steps (Street View checks, reverse image search, landmark matching).
Be explicit about uncertainty. Do not invent details that are not visible in the image.`;

const WORKFLOW = `🛰️ <b>Image geolocation (GEOINT) workflow</b>

<b>1 · Extract metadata first</b>
Check EXIF (GPS, camera, timestamp) before anything else — it often hands you the answer.

<b>2 · AI geolocation engines</b>
• ${link('GeoSpy', 'https://geospy.ai/')}
• ${link('Picarta', 'https://picarta.ai/')}
• ${link('FindLocation', 'https://findpiclocation.com/')}
• ${link('GeoFinder', 'https://geofinderai.com/')}
• ${link('EarthKit', 'https://earthkit.app/')}

<b>3 · Reverse image search</b>
• ${link('Google Lens', 'https://lens.google.com/')} • ${link('Yandex Images', 'https://yandex.com/images/')} • ${link('Lenso.ai', 'https://lenso.ai/en')} • ${link('TinEye', 'https://tineye.com/')}

<b>4 · Manual clue-cracking</b>
Language &amp; scripts, license-plate format, road markings &amp; sign shapes, architecture, vegetation/climate, sun angle &amp; shadows, utility poles. Then confirm in ${link('Google Maps / Street View', 'https://www.google.com/maps')} or ${link('Mapillary', 'https://www.mapillary.com/')}.

<b>5 · Sun &amp; shadow timing</b>
Use ${link('SunCalc', 'https://www.suncalc.org/')} to validate time of day vs. shadow direction.

<b>📋 Copy-paste AI prompt</b> (use with ChatGPT/Claude/Gemini vision):
<pre>${GEOINT_PROMPT}</pre>`;

export function registerGeoint(bot) {
  bot.command('geoint', (ctx) => replyLong(ctx, WORKFLOW));
}
