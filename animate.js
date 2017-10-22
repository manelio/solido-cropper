;(function() {

  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  function describeArc(x, y, radius, startAngle, endAngle){

      var start = polarToCartesian(x, y, radius, endAngle);
      var end = polarToCartesian(x, y, radius, startAngle);

      var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

      var d = [
          "M", start.x, start.y, 
          "A", radius, radius, 0, arcSweep, 0, end.x, end.y
      ].join(" ");

      return d;
  }

  function createVisualFeedback(r, w) {

    var xmlns = "http://www.w3.org/2000/svg";

    function createSVG(r) {
      var el = document.createElementNS(xmlns, 'svg');
      el.setAttributeNS(null, 'width', r);
      el.setAttributeNS(null, 'height', r);
      el.setAttributeNS(null, 'class', 'visualfeedback');
      return el;
    }

    function createG() {
      var el = document.createElementNS(xmlns, 'g');
      return el;
    }

    function createPath() {
      var el = document.createElementNS(xmlns, 'path');
      el.setAttribute('fill', 'none');
      el.setAttribute('stroke', 'rgba(0, 0, 255, .25)');
      el.setAttribute('stroke-width', '10');
      return el;
    }

    var svgEl = createSVG(r);
    //var gEl = createG();
    var pathEl = createPath();

    //gEl.appendChild(pathEl);
    svgEl.appendChild(pathEl);

    return {
      svg: svgEl,
      //g: gEl,
      path: pathEl,

      arcTo: function(angle) {
        
        var opacity = angle / 360 / 4;
        var width = angle / 360 * w;
        
        //this.path.setAttribute("d", describeArc(r/2, r/2, r/2 - (width / 2), 0, angle));
        //this.path.setAttribute("d", describeArc(r/2, r/2, r/2 - (w / 2), 0, angle));
        this.path.setAttribute("d", describeArc(r/2, r/2, r/2 - (w / 4 + width / 4), 0, angle));
        this.path.setAttribute("stroke-width", width);
        this.path.setAttribute("stroke", 'rgba(0, 0, 255, ' + opacity + ')');
      },

    }

  }


  var feedback = createVisualFeedback(100, 10);

  document.body.appendChild(feedback.svg);


  var to = 0;

  function animate() {
    to += 5;
    to = to % 360;

    feedback.arcTo(to);

    requestAnimationFrame(animate);
  }

  animate();



})();