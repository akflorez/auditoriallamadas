import { extractGoogleId } from './src/lib/utils';

const tests = [
  '1fUWrUSrhKCbljj0r_pLeb4JmlQ_t75T5UAWnHv3S4QI',
  'https://docs.google.com/spreadsheets/d/1fUWrUSrhKCbljj0r_pLeb4JmlQ_t75T5UAWnHv3S4QI/edit?gid=0#gid=0',
  'https://drive.google.com/drive/folders/1uVP00FSXDeSVWfLHMJcDzm8TTaP-wLCQ',
  '1uVP00FSXDeSVWfLHMJcDzm8TTaP-wLCQ'
];

tests.forEach(t => {
  console.log(`Input: ${t}`);
  console.log(`Output: ${extractGoogleId(t)}`);
  console.log('---');
});
