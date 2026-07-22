export const LOCALHOST_IP_MATCH = {
  $or: [
    { ip: { $regex: /localhost|127\.0\.0\.1|::1/i } },
    { ip: { $regex: /^::ffff:127\./ } },
    { ip: { $regex: /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/ } },
    { ip: { $regex: /^192\.168\.\d{1,3}\.\d{1,3}$/ } },
    { ip: { $regex: /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/ } },
  ],
};

export const EXCLUDE_ANALYTICS_ROUTE = {
  route: { $not: { $regex: "^/api/analytics" } },
};
