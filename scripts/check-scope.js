const changedFiles = (process.env.CHANGED_FILES || "src/accounts.js,tests/registration.test.js,tests/api-contract.test.js")
  .split(",")
  .map((file) => file.trim())
  .filter(Boolean);

const allowed = [
  /^src\/accounts\.js$/,
  /^tests\/registration\.test\.js$/,
  /^tests\/api-contract\.test\.js$/,
  /^spec\/registration-validation\.md$/
];
const protectedPaths = [/^migrations\//, /^src\/auth\//, /^tests\/login-regression\.test\.js$/, /^package(-lock)?\.json$/];

const outsideScope = changedFiles.filter((file) => !allowed.some((pattern) => pattern.test(file)));
const protectedChanges = changedFiles.filter((file) => protectedPaths.some((pattern) => pattern.test(file)));

console.log(JSON.stringify({ changedFiles, outsideScope, protectedChanges }, null, 2));
if (outsideScope.length || protectedChanges.length) {
  console.error("Scope gate failed: this task class cannot modify the listed files");
  process.exitCode = 1;
}
