const autocannon = require('autocannon');

// const url = 'http://localhost:8080/exam/mcq?username=kumar&className=a&subject=a&chapter=5&count=4'; 
const url = 'http://192.168.0.104:8080/auth/login';

// small helper to format numeric values safely
function fmt(val, digits = 2) {
  if (val === undefined || val === null) return 'N/A';
  if (typeof val === 'string' && /^[0-9.]+$/.test(val)) val = Number(val);
  if (typeof val === 'number') return Number.isFinite(val) ? val.toFixed(digits) : String(val);
  return String(val);
}

// Create the autocannon instance and provide a completion callback that prints
// a simple two-column Markdown table to the console for quick, human-readable results.
const instance = autocannon({
  url,
  connections: 10000,      // number of concurrent connections
  duration: 10,         // test duration in seconds
  method: 'POST',       // HTTP method
  body: JSON.stringify({
    "email": "anikguptatarun@gmail.com",
    "password": "123456"
  }) // if needed
  // headers: {
  //   'Content-Type': 'application/json',
  //   'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJrdW1hciIsImlhdCI6MTc1NjgyOTY1NiwiZXhwIjoxNzU2OTE2MDU2fQ.BzLHrkYfO9UFCuoqz_uwLmQJ8ytHIwyxZ3uv3vk5qP3cjcy3KSH9XSvCvqK8j4nw1oHx-Va3ygamH19VvjOZwg', // if needed
  // },
}, (err, result) => {
  if (err) {
    console.error('autocannon error:', err);
    return;
  }
});

// optional: track progress in real-time
autocannon.track(instance, { renderProgressBar: true });
