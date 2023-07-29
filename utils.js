import utils from 'util';
import { exec } from 'child_process';

export const promisifyExec = utils.promisify(exec);

export const meditaitonDurations = {
    0: '3min',
    1: '5min',
    2: '10min',
    3: '15min',
    4: '20min',
}