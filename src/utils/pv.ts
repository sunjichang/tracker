export const createHistoryEvent = <T extends keyof History>(type: T): () => any => {
  const origin = history[type];
  return function (this: any) {
      const e = new Event(type)
      window.dispatchEvent(e)
      return origin.apply(this, arguments)
  }
}