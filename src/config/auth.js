export const AUTH_CONFIG = {
  REGION: 'us-east-2',
  USER_POOL_ID: 'us-east-2_hf2QkaTAR',
  CLIENT_ID: '2qoir20jaajumrkdmjuh33slt',  // Updated with exact Client ID
  DOMAIN: 'https://us-east-2hf2qkatar.auth.us-east-2.amazoncognito.com',  // Updated with exact domain
  REDIRECT_URI: 'https://thecomptiabible.com'
};

export const getSignInUrl = () => {
  return `${AUTH_CONFIG.DOMAIN}/login?` +
    `client_id=${AUTH_CONFIG.CLIENT_ID}&` +
    'response_type=code&' +
    'scope=email+openid+phone&' +
    `redirect_uri=${encodeURIComponent(AUTH_CONFIG.REDIRECT_URI)}`;
};




