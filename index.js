/**
 * rewrite from https://github.com/substack/browser-badge with browser canvas.
 */
!function (root, factory) {
  if (typeof module === 'object' && module.exports)
    module.exports = module.exports['default'] = factory(root);
  else
    root.browserSupportBadge = factory(root);
}(typeof window !== 'undefined' ? window : this, function () {
  /**
   * 绘制 versions
   * @param ctx
   * @param versions
   * @param x
   */
  function drawVersions (ctx, versions, x) {
    var keys = Object.keys(versions).sort(function(a, b) {
      return a - b;
    });
    keys.forEach(function (key, i) {
      var v = versions[key];
      var y = 58 + i * 11;

      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = {
        'true': 'rgb(51,255,26)', // ok -> ✓ green
        'false': 'rgb(255,51,26)', // fail -> ⚑ red
        'pending': 'rgb(150,150,150)' // fail -> ⚑ red
      }[String(v)] || 'rgb(150,150,150)';
      ctx.fillText({
        'true': '✓',
        'false': '⚑',
        'pending': '-'
      }[String(v)] || '?', x, y);

      ctx.font = 'normal 10px sans-serif';
      ctx.fillText(key, x + 12, y);
    });
  }

  /**
   * 绘制圆角
   * @param ctx
   * @param x
   * @param y
   * @param w
   * @param h
   * @param r
   */
  function round (ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x, y + r);
    for (var angle = 0; angle <= 2 * Math.PI; angle += Math.PI / 2) {
      var c = Math.cos(angle);
      var s = Math.sin(angle);

      ctx.arcTo(x, y, x + w * c, y + h * s, r);
      ctx.lineTo(x + c * r, y + s * r);

      x += c * w;
      y += s * h;
    }
    ctx.closePath();
  }

  return function (browsers, cb) {
    var browserNames = Object.keys(browsers);
    // 计算宽高
    var width = browserNames.length * 52 + 2;
    var height = Math.max.apply(null, browserNames.map(function (name) {
      return Object.keys(browsers[name]).length * 11 + 58;
    }));

    // 新建 canvas 实例
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgb(55,55,55)';
    round(ctx, 0, 0, width, height, 8);
    ctx.fill();

    browserNames.forEach(function (name, idx) {
      ctx.fillStyle = 'rgb(62,62,62)';
      round(ctx, 2 + idx * 52, 2, 50, height - 4, 8);
      ctx.fill();
    });

    (function next (idx) {
      var name = browserNames[idx];
      // 结束返回
      if (!name) {
        if (cb) cb(canvas.toDataURL(), canvas);
        return;
      }

      var img = new Image();

      img.onload = function () {
        var x = 2 + 52 * idx + (52 - img.width * 0.5) / 2;
        var w = img.width * 0.5;
        var h = img.height * 0.5;

        // 绘制浏览器图标
        ctx.drawImage(img, x, 5, w, h);
        // 绘制版本号列表
        drawVersions(ctx, browsers[name], 5 + 52 * idx);
        // 处理完了一个，处理第二个
        next(idx + 1);
      };

      // 加载图片
      img.src = './static/' + name + '.png';
    })(0);
  }
});
