install:
	npm install
start:
	npx babel-node src/index.js
build:
	rm -rf dist
	npm run build
publish:
	npm publish
lint:
	npx eslint .
test:
	npx jest
watch:
	npm run test -- --watch
