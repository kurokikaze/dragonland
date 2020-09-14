import {createHash} from 'crypto';
import config from '../config.js';

export function getPasswordHash(password) {
	const hash = createHash('MD5');
	hash.update(password + config.passwordSalt);
	return hash.digest('base64');
}
