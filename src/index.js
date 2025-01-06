/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		if (request.method === 'POST') {
			const data = await request.json();
			const { name, lastname, email, subject, interest, company, projectDescription, message } = data.form;

			const SENDGRID_API_KEY = env.SENDGRID_API_KEY;


			const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${SENDGRID_API_KEY}`,
				},
				body: JSON.stringify({
					personalizations: [{
						to: [{ email: env.EMAIL_TO }],
						subject: subject,
					}],
					from: { email: email },
					content: [{
						type: 'text/plain',
						value: `Name: ${name} ${lastname}\nCompany: ${company}\nInterest: ${interest}\nProject Description: ${projectDescription}\nMessage: ${message}`,
					}],
				}),
			});

			if (!response.ok) {
				return new Response('Failed to send email', { status: 500 });
			}

			return new Response('Email sent successfully');
		}
		return new Response('Hello World!');
	},
};
