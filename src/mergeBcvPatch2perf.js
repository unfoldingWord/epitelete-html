
  const mergedCopy = (perfSequence, ws) => {
    const { blocks: _blocks, ...seqProps } = perfSequence
    return {
      ...seqProps,
      blocks: _blocks?.reduce((blockArr, block) => {
        const { content: _content, ...blockProps } = block
        const doCheck = ((block?.type === 'paragraph') && (block?.subtype === 'usfm:p')) 
        let content = (!doCheck) ? _content : _content?.reduce((cArr,item) => {
          if (item.type === 'mark') {
            if (item?.subtype === 'verses') {
              ws.curBcvObj.vId = item?.atts?.number
            } else if (item?.subtype === 'chapter') {
              ws.curBcvObj.chId = item?.atts?.number
              ws.curBcvObj.vId = 1
            }
          }
          const chk = ws.curBcvObj
          let inRange = (item.type !== 'mark') && ws.bcvMutations[`${chk.bookId}.${chk.chId}.${chk.vId}`] != null
          let doMerge = false
          if (inRange) {
            if (!ws.hasBeenReplaced[`${chk.bookId}.${chk.chId}.${chk.vId}`] ) {
              ws.hasBeenReplaced[`${chk.bookId}.${chk.chId}.${chk.vId}`] = true
              doMerge = true
            }
          }
          return !inRange 
                    ? cArr.concat(item) 
                    : doMerge 
                      ? cArr.concat(ws.bcvMutations[`${chk.bookId}.${chk.chId}.${chk.vId}`]?.replace)
                      : cArr
        }, [])

        const retBlock = (!content) ?  blockProps : {
          content,
          ...blockProps,
        }
        return blockArr.concat(retBlock)
      }, [])
    }
  };

function mergeBcvPatch2perf(perfDoc, bcvMutations, sequenceId) {
  const bookCode = perfDoc?.metadata?.document?.bookCode
  const bookId = bookCode?.charAt(0)?.toUpperCase() + bookCode?.slice(1)?.toLowerCase()
  const workspace = {
    bcvMutations,
    hasBeenReplaced: {},
    curBcvObj: { 
      bookId,
      chId: 1,
      vId: 1,
     }
  }

  const perfSequence = perfDoc.sequences[sequenceId];
  return mergedCopy(perfSequence, workspace);
}

export default mergeBcvPatch2perf;
