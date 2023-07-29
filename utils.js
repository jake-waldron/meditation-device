import utils from 'util';
import { exec } from 'child_process';

export const promisifyExec = utils.promisify(exec);
