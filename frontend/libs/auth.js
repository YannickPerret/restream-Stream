export const isTokenExpired = (token) => {
    if (!token || !token.expiresAt) return true;
    const expiryDate = new Date(token.expiresAt);
    const now = new Date();
    return now >= expiryDate;
};