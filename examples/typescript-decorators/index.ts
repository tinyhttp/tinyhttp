import { App } from '@tinyhttp/app';
import { basePath, get, register } from 'express-decorators';

@basePath('/hello')
class TestController {

    @get('/world')
    async sayHelloAction(request, response) {
        response.send('<h1>Hello World</h1>');
    }

}

const app = new App();

register(app, new TestController());

app.listen(3000, () => console.log('Started on http://localhost:3000'));


