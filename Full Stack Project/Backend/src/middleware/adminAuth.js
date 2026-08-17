// Lightweight auth guard for admin-only endpoints (e.g. song upload).
// Not a full auth system — just enough to stop anonymous internet users
// from hitting the unauthenticated /wp-admin upload form.
//
// Set ADMIN_KEY in Backend/.env. The frontend Admin page sends it back
// as the "x-admin-key" header on every upload request.
function adminAuth(req, res, next) {
    const configuredKey = process.env.ADMIN_KEY;

    if (!configuredKey) {
        console.warn(
            "⚠️  ADMIN_KEY is not set in Backend/.env — the song upload endpoint is UNPROTECTED. " +
            "Set ADMIN_KEY to require an admin key for uploads."
        );
        return next();
    }

    const providedKey = req.header("x-admin-key");

    if (!providedKey || providedKey !== configuredKey) {
        return res.status(401).json({ message: "Unauthorized: missing or invalid admin key" });
    }

    next();
}

module.exports = adminAuth;
