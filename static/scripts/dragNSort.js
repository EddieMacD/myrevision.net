//Not my script - only adapted

//Drag and drop stuff
function DragNSort (config) {
    this.$activeItem = null;
    this.$items = document.querySelectorAll('.' + config.itemClass);
    this.dragStartClass = config.dragStartClass;
    this.dragEnterClass = config.dragEnterClass;
}

DragNSort.prototype.removeClasses = function () {
    [].forEach.call(this.$items, function ($item) {
        $item.classList.remove(this.dragStartClass, this.dragEnterClass);
    }.bind(this));
};

DragNSort.prototype.on = function (elements, eventType, handler) {
    [].forEach.call(elements, function (element) {
        element.addEventListener(eventType, handler.bind(element, this), false);
    }.bind(this));
};

DragNSort.prototype.onDragStart = function (_this, event) {
    _this.$activeItem = this;

    this.classList.add(_this.dragStartClass);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', this.innerHTML);
};

DragNSort.prototype.onDragEnd = function (_this) {
    this.classList.remove(_this.dragStartClass);
};

DragNSort.prototype.onDragEnter = function (_this) {
    this.classList.add(_this.dragEnterClass);
};

DragNSort.prototype.onDragLeave = function (_this) {
    this.classList.remove(_this.dragEnterClass);
};

DragNSort.prototype.onDragOver = function (_this, event) {
    if (event.preventDefault) {
        event.preventDefault();
    }

    event.dataTransfer.dropEffect = 'move';

    return false;
};

DragNSort.prototype.onDrop = function (_this, event) {
    if (event.stopPropagation) {
        event.stopPropagation();
    }

    var startLabel = $("." + _this.dragStartClass).find("label");
    var enterLabel = $("." + _this.dragEnterClass).find("label");


    if((startLabel.length === 1) && (enterLabel.length === 1))
    {
        if (_this.$activeItem !== this) {
            var temp = startLabel.text();
            startLabel.text(enterLabel.text());
            enterLabel.text(temp);
        }
    }

    _this.removeClasses();

    return false;
};

DragNSort.prototype.bind = function () {
    this.on(this.$items, 'dragstart', this.onDragStart);
    this.on(this.$items, 'dragend', this.onDragEnd);
    this.on(this.$items, 'dragover', this.onDragOver);
    this.on(this.$items, 'dragenter', this.onDragEnter);
    this.on(this.$items, 'dragleave', this.onDragLeave);
    this.on(this.$items, 'drop', this.onDrop);
};

DragNSort.prototype.init = function () {
    this.bind();
};

function initDrag() {
    var draggable = new DragNSort({
        itemClass: 'drag-item',
        dragStartClass: 'drag-start',
        dragEnterClass: 'drag-enter'
    });

    draggable.init();
}