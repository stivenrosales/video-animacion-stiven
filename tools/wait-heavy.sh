#!/bin/sh
# Block until no heavy job (render, encode, denoise) of any builder is running. Waiter shells are ignored.
while ps -axo command | grep -E "remotion|render-chunks|finalize.sh|deep-filter|cutcheck" | grep -v -E "pgrep|grep|wait-heavy" | grep -q .; do sleep 30; done
