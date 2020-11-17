let data = [
    {
        id: 1,
        name: 'Sparky',
        type: 'dog',
        tags: [ 'sweet' ],
    },
    {
        id: 2,
        name: 'buzz',
        type: 'cat',
        tags: [ 'purrfect' ],
    },
    {
        id: 3,
        name: 'max',
        type: 'dog',
        tags: [],
    },
];

export default class Pets {
    constructor() {
        this.id = 4;
    }

    findAll({ type, limit }) {
        return data.filter(d => d.type == type).slice(0, limit);
    }

    create(pet) {
        const npet = { id: this.id++, ...pet }
        data.push(npet)
        return npet
    }

    delete(id) {
        return data.filter(eid => eid !== id)
    }
}