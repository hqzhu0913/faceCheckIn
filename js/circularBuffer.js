// IMPLEMENTATION
function CircularArray(maxLength) {
  this.maxLength = maxLength;
}

CircularArray.prototype = Object.create(Array.prototype);

CircularArray.prototype.push = function(element) {
  Array.prototype.push.call(this, element);
  while (this.length > this.maxLength) {
    this.shift();
  }
}