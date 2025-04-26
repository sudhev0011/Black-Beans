function setCookie(tokenName, token, maxAge, res) {
  console.log(`Setting cookie: ${tokenName}, maxAge: ${maxAge}`);
  res.cookie(tokenName, token, {
    httpOnly: true,
    secure: false, // Set to false for local development
    sameSite: 'lax', // Changed from 'strict' to 'lax' for better cross-origin compatibility
    maxAge: maxAge,
    path: '/', // Ensure cookie is available for all paths
    // domain: 'localhost'
  });
}

module.exports = setCookie;