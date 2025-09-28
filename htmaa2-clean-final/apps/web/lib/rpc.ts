// Local RPC functions to avoid import issues
export type TouchInteraction = {
  x: number,
  y: number
}

export type TouchInteractionData = {
  source: 'start' | 'move' | 'end',
  touches: TouchInteraction[]
}

export type TouchInteractionRequest = {
  method: 'touch_interaction_request',
  data: TouchInteractionData,
}

export type Mounted = {
  method: 'mounted'
}

export type DisplaySize = {
  method: 'display_size',
  width: number,
  height: number
}

export type CameraZoomDistanceRequest = {
  method: 'camera_zoom_distance_request'
}

export type SetPossibleCameraParametersRequest = {
  method: 'set_possible_camera_parameters_request',
  currentZoom: number,
  verticalOffset: number,
  horizontalOffset: number,
}

export type SetCameraParametersRequest = {
  method: 'set_camera_parameters_request',
  currentZoom: number,
  verticalOffset: number,
  horizontalOffset: number,
}

export type CameraZoomDistanceResponse = {
  method: 'camera_zoom_distance_response',
  
  min_distance: number,
  max_distance: number,
  current_distance: number,

  horizontal_offset: number,
  max_horizontal_offset: number,

  vertical_offset: number,
  max_vertical_offset: number,
}

export type EnableSoundMessage = {
  method: 'enable_sound_message',
  enabled: boolean,
}

export type RequestToParent = Mounted | TouchInteractionRequest | CameraZoomDistanceRequest | SetPossibleCameraParametersRequest | SetCameraParametersRequest;
export type MessageFromParent = CameraZoomDistanceResponse | EnableSoundMessage | DisplaySize;

// Result type to match the original implementation
export type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

export function Ok<T>(data: T): Result<T> {
  return { ok: true, value: data };
}

export function Err(error: Error): Result<never> {
  return { ok: false, error };
}

export function sendMessageToChild(target: Window | null, message: MessageFromParent) {
  if (!target) { return; }
  
  target.postMessage(message, '*');
}

export function parseRequestFromChild(event: MessageEvent): Result<RequestToParent> {
  // NOTE: As this is the serialization function, we do not know for certain that the data from event.data[...] exists.
  const method = event.data['method'] ?? null;

  switch (method) {
    case 'camera_zoom_distance_request': {
      return Ok({ method: 'camera_zoom_distance_request' });
    }

    case 'set_possible_camera_parameters_request': {
      return Ok({
        method: 'set_possible_camera_parameters_request',
        currentZoom: event.data['currentZoom'],
        horizontalOffset: event.data['horizontalOffset'],
        verticalOffset: event.data['verticalOffset'],
      });
    }

    case 'set_camera_parameters_request': {
      return Ok({
        method: 'set_camera_parameters_request',
        currentZoom: event.data['currentZoom'],
        horizontalOffset: event.data['horizontalOffset'],
        verticalOffset: event.data['verticalOffset'],
      });
    }

    case 'touch_interaction_request': {
      return Ok({
        'method': 'touch_interaction_request',
        'data': event.data['data'],
      });
    }

    case 'mounted': {
      return Ok({ method: 'mounted' });;
    }

    default: {
      return Err(Error("Not a deserializable data structure"));
    }
  }
}
