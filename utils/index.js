export function extractSequence(perf, id = null) {
  const sequenceId = id ?? perf.mainSequenceId;
  // console.log(perf)
  const sequence = perf.sequencesHtml[sequenceId]
  return [sequenceId, sequence]
}