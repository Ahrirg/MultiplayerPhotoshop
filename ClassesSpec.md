### OBJECTS FOR GAME
```
Object {
    id: string,
    user_name: string, (last user that updated this object)

    modifications: modification[] (Order important!!)
    size: {x: int, y: int}
    position: {x: int, y: int}
}

Image inherits Object {
    image_uuid: string,
}

Text inherits Object {
    content: string,
    font: string,
    font_size: int,
}
```

### MODIFICATIONS
```
Modification_Base {
    id: string,
    user_name: string,

    tool: string
}

contrast inherits Modification_Base {
    contrast: int (-100 -> 100)
}

and more
```
