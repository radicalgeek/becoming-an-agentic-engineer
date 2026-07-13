# Remediate or rebuild

Classify the root cause before changing code.

- If the specification is correct and the implementation is wrong, create a bounded remediation task and run it through the same gate set.
- If the implementation follows an incorrect or incomplete specification, correct the specification or context pack, discard the generated implementation change, and rebuild from the corrected source.
- If the same gate fails on two consecutive rebuilds, stop and review the specification and gate itself before a third run.
