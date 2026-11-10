const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const origin = configuredOrigin ? new URL(configuredOrigin).origin : '';
if (configuredOrigin && !/^https?:\/\//.test(configuredOrigin)) { throw new Error('NEXT_PUBLIC_SITE_URL must be an absolute HTTP(S) URL'); }
export const site = {name:'Thinkcat Labs', email:'', legalName:'', icp:'', policeRecord:'', origin};
