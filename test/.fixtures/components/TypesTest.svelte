<script>
  import {
    Action,
    Navigation,
    Page,
    Snapshot,
    Config,
    Cookie,
    Error,
    HttpError,
    RequestEvent,
    ResolveOptions,
  } from '$app/types'

  const actionTruthy = !!Action
  const navTruthy = !!Navigation
  const pageTruthy = !!Page
  const snapshotTruthy = !!Snapshot
  const configTruthy = !!Config
  const cookieTruthy = !!Cookie
  const errorTruthy = !!Error
  const httpErrorTruthy = !!HttpError
  const requestEventTruthy = !!RequestEvent
  const resolveOptionsTruthy = !!ResolveOptions
</script>

<div class="types">
  <span class="action">{actionTruthy ? 'true' : 'false'}</span>
  <span class="navigation">{navTruthy ? 'true' : 'false'}</span>
  <span class="page">{pageTruthy ? 'true' : 'false'}</span>
  <span class="snapshot">{snapshotTruthy ? 'true' : 'false'}</span>
  <span class="config">{configTruthy ? 'true' : 'false'}</span>
  <span class="cookie">{cookieTruthy ? 'true' : 'false'}</span>
  <span class="error">{errorTruthy ? 'true' : 'false'}</span>
  <span class="httperror">{httpErrorTruthy ? 'true' : 'false'}</span>
  <span class="requestevent">{requestEventTruthy ? 'true' : 'false'}</span>
  <span class="resolveoptions">{resolveOptionsTruthy ? 'true' : 'false'}</span>
</div>
