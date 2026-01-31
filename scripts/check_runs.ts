
const url = 'https://backend-production-dfd3.up.railway.app/runs?walletAddress=0x0246fe9B176E0225f9F5d7A2372DAc6865B55c18&limit=1';
console.log(`Checking ${url}...`);

fetch(url)
  .then(res => {
    console.log(`Status: ${res.status}`);
    return res.text();
  })
  .then(text => console.log(`Body snippet: ${text.substring(0, 200)}`))
  .catch(err => console.error(`Error: ${err.message}`));
