import args from './args.mjs';

const { days: rawDaysThreshold, force: forceUpdate } = args;

export default {
  daysThreshold: Number(rawDaysThreshold),
  forceUpdate,
};
