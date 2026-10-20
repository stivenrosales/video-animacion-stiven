// Person matte with Apple Vision: swift segment.swift in.jpg out-mask.png
import Foundation
import Vision
import CoreImage
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
let input = CIImage(contentsOf: URL(fileURLWithPath: args[1]))!
let request = VNGeneratePersonSegmentationRequest()
request.qualityLevel = .accurate
request.outputPixelFormat = kCVPixelFormatType_OneComponent8
try VNImageRequestHandler(ciImage: input).perform([request])
let mask = CIImage(cvPixelBuffer: request.results!.first!.pixelBuffer)
let scaled = mask.transformed(by: CGAffineTransform(scaleX: input.extent.width / mask.extent.width,
                                                    y: input.extent.height / mask.extent.height))
let ctx = CIContext()
let cg = ctx.createCGImage(scaled, from: input.extent)!
let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: args[2]) as CFURL, UTType.png.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(dest, cg, nil)
CGImageDestinationFinalize(dest)
