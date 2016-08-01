"use strict";

/**
 * Created by root on 01/08/16.
 */
var test_es = 5;
"use strict";

/**
 * Created by root on 27/07/16.
 */
(function (jquery) {
  console.log(jquery);
})("hhah");
"use strict";

/**
 * Created by root on 19/09/15.
 */

var POWER_CONFIG = {
  power_content_tpl: _.template($("#power_content_tpl").html()),

  ready_init: function ready_init() {
    var self = this;
    self.load_group();
  },

  load_group: function load_group() {
    var self = this;
    var group = $.cookie("group");
    if ($.cookie("group")) {
      $(".power_nav#" + group + "_nav").addClass("active").siblings().removeClass("active");
    } else {
      $(".power_nav:first").addClass("active").siblings().removeClass("active");
    }
    self.power_content_show();
  },

  power_content_show: function power_content_show(page, event) {
    var self = POWER_CONFIG;
    var group = $(".power_nav.active").data("group");
    var $power_box = $(".power_content_box");
    $power_box.empty();
    G_FUNCS.ajax_get($power_box, { group: group }, function (data) {
      if (data.stat === "success") {
        if (data.data.length === 0) {
          if (group === "partner_dispatcher") {
            $power_box.append($("<div class='no_infor'>暂无调度员信息</div>"));
          } else if (group === "partner_admin") {
            $power_box.append($("<div class='no_infor'>暂无管理员信息</div>"));
          } else if (group === "partner_super") {
            $power_box.append($("<div class='no_infor'>暂无超级管理员成信息</div>"));
          } else if (group === "partner_accountant") {
            $power_box.append($("<div class='no_infor'>暂无财务人员信息</div>"));
          }
        }
        _.each(data.data, function (datas) {
          var $power_content_tpl = $($.trim(self.power_content_tpl(datas)));
          $power_box.append($power_content_tpl);
        });
        G_FUNCS.pagenation($(".power_page_box"), data.pages, data.page, self.power_content_show);
      }
    });
  },

  new_dispatch_click: function new_dispatch_click() {
    var $modal = $("#new_dispatch_modal");
    $modal.modal("show");
    var group_active = $(".power_nav.active").data("group");
    $modal.find(".group").val(group_active);
  },

  power_nav: function power_nav($obj) {
    var self = this;
    var group = $obj.data("group");
    $obj.addClass("active").siblings().removeClass("active");
    $.cookie("group", group);
    self.load_group();
  },

  new_dispatch_form: function new_dispatch_form($obj) {
    var self = this;
    var group_active = $(".power_nav.active").data("group");
    G_FUNCS.ajax_post($obj, function (data) {
      if (data.stat === "success") {
        $obj.kz_clear();
        $obj.closest(".modal").modal("hide");
        if (group_active == "partner_dispatcher") {
          alertify.success("添加调度员成功");
        } else if (group_active == "partner_admin") {
          alertify.success("添加管理员成功");
        } else if (group_active == "partner_super") {
          alertify.success("添加超级管理员成功");
        } else if (group_active == "partner_accountant") {
          alertify.success("添加财务人员成功");
        }
        G_FUNCS.reload();
      }
    });
  }
};

$(function () {
  POWER_CONFIG.ready_init();
}).on("click", ".new_dispatch_click", function () {
  POWER_CONFIG.new_dispatch_click();
}).on("submit", ".new_dispatch_form", function () {
  POWER_CONFIG.new_dispatch_form($(this));
  return false;
}).on("click", ".power_nav", function () {
  POWER_CONFIG.power_nav($(this));
});
'use strict';

var FUNC = {
    _content_tpl: _.template($('#content_tpl').html()),
    $content_container: $('#content_container'),
    $page_box: $('#page_box'),

    read_broadcast: function read_broadcast(data) {
        var self = this;
        var url = $("tr").attr("url");
        var obj_ids = _.map(data, function (i) {
            return i.id;
        });
        $.getJSON(url, { obj_ids: obj_ids }, function (data) {});
    },

    query_broadcast: function query_broadcast(page, event) {
        var self = FUNC;

        G_FUNCS.ajax_get(self.$content_container, {
            page: page
        }, function (data) {
            if (data.stat === 'success') {
                self.$content_container.html(self._content_tpl({ data: data }));
                G_FUNCS.pagenation(self.$page_box, data.pages, data.page, self.query_broadcast);
            }
        });
    },

    affiche_box_line: function affiche_box_line($obj) {
        var self = this;
        var id = $obj.attr("id");
        var url = $obj.attr("url");
        var hasclass = $obj.hasClass("new_status");
        if (hasclass) {
            $.getJSON(url, { obj_ids: [id] }, function (data) {
                if (data.stat === "success") {
                    $obj.removeClass("new_status");
                    var notice_num = $("#notice_nav_notice").text();
                    var receive_num = $("#receive_num").text();
                    if (notice_num !== "" && notice_num !== "99+") {
                        var read_num = parseInt(notice_num) - 1;
                        if (read_num === 0) {
                            read_num = "";
                        }
                        $("#notice_nav_notice").text(read_num);
                    }
                    if (receive_num !== "" && receive_num !== "99+") {
                        var read_receive_num = parseInt(receive_num) - 1;
                        if (read_receive_num === 0) {
                            read_receive_num = "";
                            $("#receive_num").closest(".notice_receive_parent").css("display", "none");
                        }
                        $("#receive_num").text(read_receive_num);
                    }
                }
            });
        }
    },

    ready_init: function ready_init() {
        var self = this;
        self.query_broadcast();
    },

    affiche_detail_click: function affiche_detail_click($obj) {
        var self = this;
        var $modal = $("#affiche_detail_modal");
        var data_detail = $obj.data("detail");
        $modal.find(".modal-title").html(data_detail.title);
        $modal.find(".create_time_text").html(data_detail.create_time);
        $modal.find(".content_text").html(data_detail.content);
        self.affiche_box_line($obj.closest(".affiche_box_line"));
        $modal.modal("show");
    }
};

$(function () {
    FUNC.ready_init();
}).on("click", ".affiche_detail_click", function () {
    FUNC.affiche_detail_click($(this));
});
"use strict";

window.onload = function () {
  console.log(11);
};