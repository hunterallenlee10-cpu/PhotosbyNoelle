"""Outline text from a variable font instance into SVG path data.

Usage: python glyph-paths.py <font.woff2> <wdth> <wght> <tracking-em> <text>
Prints JSON {d, width, ascent, capHeight, upm} with y flipped for SVG (baseline at y=0).
Used once to build the wordmark/favicon SVGs; not part of the site build.
"""
import json, sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

path, wdth, wght, track, text = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
font = TTFont(path)
inst = instantiateVariableFont(font, {"wdth": wdth, "wght": wght}, inplace=False)
gs = inst.getGlyphSet()
cmap = inst.getBestCmap()
upm = inst["head"].unitsPerEm
pen = SVGPathPen(gs)
x = 0
for ch in text:
    name = cmap[ord(ch)]
    g = gs[name]
    g.draw(TransformPen(pen, (1, 0, 0, -1, x, 0)))
    x += g.width + track * upm
x -= track * upm
os2 = inst["OS/2"]
print(json.dumps({"d": pen.getCommands(), "width": x, "ascent": inst["hhea"].ascent, "capHeight": getattr(os2, "sCapHeight", 0), "xHeight": getattr(os2, "sxHeight", 0), "upm": upm}))
