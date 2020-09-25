/* globals describe, it, expect */
import request from 'supertest';

import initApp from '../../app.js';
import { getClose } from '../../utils/database.js';

async function login(server, username, password) {
	let cookie = null;

	await server.post('/users/login')
		.send(`username=${username}`)
		.send(`password=${password}`)
		.expect(302)
		.then(res => {
			console.dir(res.headers);
			console.dir(res.headers['set-cookie'].length);
			console.log('Now to Expect');
			expect(res.headers['set-cookie']).toHaveLength(1);
			cookie = res
				.headers['set-cookie'][0]
				.split(',')
				.map(item => item.split(';')[0])
				.join(';');
		});
	return cookie;
}

describe('challenges', () => {
	it('GET challenges', async (done) => {
		initApp(async app => {
	
			const server = request.agent(app);
	
			const cookie = await login(server, 'tester', 'testing');	
	
			server
				.get('/api/challenges')
				.set('Cookie', cookie)
				.expect(200)
				.expect('Content-Type', /json/)
				.end(function(err, res) {
					expect(res.body).toEqual([]);
					if (err) return done(err);

					const close = getClose();
					close();

					return done();					
				});
		});
	});

	it('POST challenges', async done => {
		initApp(async app => {
	
			const server = request.agent(app);
	
			const cookie = await login(server, 'tester', 'testing');
	
			await server.post('/api/challenges')
				.set('Cookie', cookie)
				.send({
					deckId: '5f5f316b1de2a56e486d33f0',
				})
				.expect(200);

			server
				.get('/api/challenges')
				.set('Cookie', cookie)
				.expect(200)
				.expect('Content-Type', /json/)
				.end(function(err, res) {
					expect(res.body).toEqual([
						{
							user: 'Testing account',
							userId: 2,
							deck: 'Test Cald deck',
							deckId: '5f5f316b1de2a56e486d33f0',
						},
					]);
					if (err) return done(err);

					const close = getClose();
					close();

					return done();					
				});
		});
	});
});
