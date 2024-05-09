import { getRecord } from './create-read-update.mjs';

const oneStateToRuleThemAll = await getRecord('state', 1);

export default oneStateToRuleThemAll;
