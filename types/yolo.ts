export interface YoloDetection {
  x: number;
  y: number;
  w: number;
  h: number;
  conf: number;
  cls: number;
  name: string;
}

export interface YoloResponse {
  detections: YoloDetection[];
}

export interface YoloDetectRequest {
  imageBase64: string;
  model?: "yolov8n.pt" | "yolov8s.pt" | "yolov8m.pt";
}
