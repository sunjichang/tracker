import { DefaultOptions, Options, TrackerConfig, reportTrackerData } from '../types/core'
import { createHistoryEvent } from '../utils/pv'

const MouseEventList: string[] = ['click', 'dblclick', 'contextmenu', 'mousedown', 'mouseup', 'mouseenter', 'mouseout', 'mouseover']

export class Tracker {
  public data: Options
  private version: string | undefined

  constructor(options: Options) {
    this.data = Object.assign(this.initDefaultOptions(), options)
    this.initTracker()
  }

  public setUuid<T extends DefaultOptions['uuid']>(uuid: T) {
    this.data.uuid = uuid
  }

  public setExtra<T extends DefaultOptions['extra']>(extra: T) {
    this.data.extra = extra
  }

  public sendTracker<T extends reportTrackerData>(data: T) {
    this.reportTracker(data)
  }

  private initDefaultOptions(): DefaultOptions {
    this.version = TrackerConfig.version
    return <DefaultOptions>{
      sdkVersion: this.version,
      historyTracker: false,
      hashTracker: false,
      domTracker: false,
      jsError: false
    }
  }

  private initTracker() {
    if (this.data.historyTracker) {
      window.history['pushState'] = createHistoryEvent('pushState')
      window.history['replaceState'] = createHistoryEvent('replaceState')
      this.captureEvents(['pushState'], 'history-pv')
      this.captureEvents(['replaceState'], 'history-pv')
      this.captureEvents(['popState'], 'history-pv')
    }
    if (this.data.hashTracker) {
      this.captureEvents(['hashchange'], 'hash-pv')
    }
    if (this.data.domTracker) {
      this.targetKeyReport()
    }
    if (this.data.jsError) {
      this.jsError()
    }
  }

  private captureEvents<T>(mouseEventList: string[], targetKey: string, data?: T) {
    mouseEventList.forEach(event => {
      window.addEventListener(event, () => {
        this.reportTracker({ event, targetKey, data })
      })
    })
  }

  private targetKeyReport() {
    MouseEventList.forEach(event => {
      window.addEventListener(event, e => {
        const target = e.target as HTMLElement
        const targetValue = target.getAttribute('target-key')
        if (targetValue) {
          this.sendTracker({
            targetKey: targetValue,
            event
          })
        }
      })
    })
  }

  private jsError() {
    this.errorEvent()
    this.promiseReject()
  }

  private errorEvent() {
    window.addEventListener('error', e => {
      this.sendTracker({
        targetKey: 'error',
        event: 'js-error',
        message: e.message
      })
    })
  }

  private promiseReject() {
    window.addEventListener('unhandledrejection', event => {
      event.promise.catch(error => {
        this.sendTracker({
          targetKey: 'reject',
          event: 'promise',
          message: error
        })
      })
    })
  }

  private reportTracker<T>(data: T) {
    const params = Object.assign(this.data, data, { time: new Date().getTime() })
    const headers = {
      type: 'application/x-www-form-urlencoded'
    }
    const blob = new Blob([JSON.stringify(params)], headers)
    navigator.sendBeacon(this.data.requestUrl, blob)
  }
}
