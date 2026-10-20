// Face boxes per frame: swift faces.swift dir > faces.json  (y from top, normalized)
import Foundation
import Vision
let dir = CommandLine.arguments[1]
let files = try FileManager.default.contentsOfDirectory(atPath: dir).filter { $0.hasSuffix(".jpg") }.sorted()
var out: [[String: Double]] = []
for (i, f) in files.enumerated() {
  let req = VNDetectFaceRectanglesRequest()
  try VNImageRequestHandler(url: URL(fileURLWithPath: dir + "/" + f)).perform([req])
  if let b = (req.results ?? []).max(by: { $0.boundingBox.width < $1.boundingBox.width })?.boundingBox {
    out.append(["t": Double(i) / 2, "x": b.midX, "top": 1 - b.maxY, "bottom": 1 - b.minY])
  }
}
print(String(data: try JSONSerialization.data(withJSONObject: out), encoding: .utf8)!)
