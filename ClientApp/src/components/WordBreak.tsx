import React from 'react'
//Returns JSX segment and avoids dangerouslySetInnerHTML.
//Allows custom word breaks to be preferentially set for CSS overflow-wrap.
const insertWordBreaks = (word: string): React.ReactElement[] | null => {
  try {
    if (!word || word === "")
      return [<></>]
    //replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
    return (word as string).split(new RegExp(`(?<=\\.|_)`)).map(strSegment => <>{strSegment}<wbr /></>)
  } catch (error) {
    //console.log(word)
    return [<></>]
  }
 
}

export default insertWordBreaks