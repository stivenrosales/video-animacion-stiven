// Person mattes for every frame in a folder: swift segdir.swift inDir outDir
import Foundation
import Vision
import CoreImage
import ImageIO
import UniformTypeIdentifiers

let inDir = CommandLine.arguments[1], outDir = CommandLine.arguments[2]
let ctx = CIContext()
for f in try FileManager.default.contentsOfDirectory(atPath: inDir).filter({ $0.hasSuffix(".png") }).sorted() {
  let input = CIImage(contentsOf: URL(fileURLWithPath: inDir + "/" + f))!
  let req = VNGeneratePersonSegmentationRequest()
  req.qualityLevel = .accurate
  req.outputPixelFormat = kCVPixelFormatType_OneComponent8
  try VNImageRequestHandler(ciImage: input).perform([req])
  let m = CIImage(cvPixelBuffer: req.results!.first!.pixelBuffer)
  let s = m.transformed(by: CGAffineTransform(scaleX: input.extent.width / m.extent.width, y: input.extent.height / m.extent.height))
  let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: outDir + "/" + f) as CFURL, UTType.png.identifier as CFString, 1, nil)!
  CGImageDestinationAddImage(dest, ctx.createCGImage(s, from: input.extent)!, nil)
  CGImageDestinationFinalize(dest)
}
