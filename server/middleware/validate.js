// Request-body validation middleware factory.
//
//   router.post('/login', validate(loginSchema), login);
//
// On success req.body is replaced with the schema's parsed output (so trim /
// lowercase normalizations actually reach the controller) and next() runs.
// On failure it answers 400 with a deliberately generic message: zod issues
// echo field paths and constraint details back to the caller, so they are
// logged server-side (paths/codes only - never values, which could contain a
// password) and never serialized into the response.
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (result.success) {
    req.body = result.data;
    return next();
  }

  console.warn('Request validation failed', {
    requestId: req.id,
    route: `${req.baseUrl}${req.path}`,
    issues: result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      code: issue.code,
    })),
  });

  return res.status(400).json({ message: 'Invalid request data' });
};

export default validate;
