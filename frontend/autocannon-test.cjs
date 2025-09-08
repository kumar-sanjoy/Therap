const autocannon = require('autocannon');

const url = 'http://localhost:8080/exam/mcq?username=kumar&className=a&subject=a&chapter=5&count=4'; 

const instance = autocannon({
  url,
  connections: 50,      // number of concurrent connections
  duration: 10,         // test duration in seconds
  method: 'POST',       // HTTP method
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJrdW1hciIsImlhdCI6MTc1NjgyOTY1NiwiZXhwIjoxNzU2OTE2MDU2fQ.BzLHrkYfO9UFCuoqz_uwLmQJ8ytHIwyxZ3uv3vk5qP3cjcy3KSH9XSvCvqK8j4nw1oHx-Va3ygamH19VvjOZwg', // if needed
  },
}, console.log);

// optional: track progress in real-time
autocannon.track(instance, { renderProgressBar: true });
