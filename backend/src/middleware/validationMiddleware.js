export const validateRequest = (schema) => (req, _res, next) => {
	const parsed = schema.safeParse({
		body: req.body,
		params: req.params,
		query: req.query
	});

	if (!parsed.success) {
		next(parsed.error);
		return;
	}

	req.body = parsed.data.body;
	req.params = parsed.data.params;
	req.query = parsed.data.query;
	next();
};
