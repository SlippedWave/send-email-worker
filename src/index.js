export default {
	async fetch(request, env, ctx) {
		if (request.headers.get('origin') !== env.DOMAIN_ADDRESS) {
			return new Response('Forbidden', { status: 403 });
		}

		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': env.DOMAIN_ADDRESS,
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
					'Vary': 'Origin',
				},
			});
		}

		if (request.headers.get('content-type') !== 'application/json') {
			return new Response(null, { status: 415 })
		}
		if (request.method !== 'POST') {
			return new Response(null, { status: 405 })
		}

		if (request.method === 'POST') {
			try {
				const data = await request.json();
				const { name, lastname, email, subject, interest, company, projectDescription, message } = data;

				const SENDGRID_API_KEY = env.SENDGRID_API_KEY;
				const EMAIL_TO = env.EMAIL_TO;
				const MAIL_FROM = env.MAIL_FROM;

				const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${SENDGRID_API_KEY}`,
					},
					body: JSON.stringify({
						personalizations: [{
							to: [{ email: EMAIL_TO }],
							subject: subject,
							dynamic_template_data: {
								name: name,
								lastname: lastname,
								subject: subject,
								email: email,
								interest: interest,
								company: company,
								projectDescription: projectDescription,
								message: message,
							}
						}],
						from: { email: MAIL_FROM },
						template_id: env.SENDGRID_TEMPLATE_ID,
					}),
				});

				if (!response.ok) {
					return new Response('Failed to send email', { status: 500 });
				}

				return new Response('Email sent successfully', {
					headers: {
						'Access-Control-Allow-Origin': env.DOMAIN_ADDRESS,
						'Vary': 'Origin',
					},
				});
			} catch (error) {
				return new Response('Invalid request payload', { status: 400 });
			}
		}

		return new Response('Hello World!', {
			headers: {
				'Access-Control-Allow-Origin': env.DOMAIN_ADDRESS,
				'Vary': 'Origin',
			},
		});
	},
};
