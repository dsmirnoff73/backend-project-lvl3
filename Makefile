install:
	npm install
start:
	npx babel-node src/bin/page-loader.js
build:
	rm -rf dist
	npm run build
	npm link
publish:
	npm publish
lint:
	npx eslint .
test:
	npx jest
watch:
	npm run test -- --watch
debug:
	DEBUG=page-loader:* npx babel-node src/bin/page-loader.js --output  var/temp http://hexlet.io/courses
