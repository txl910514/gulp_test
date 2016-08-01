/**
 * Created by root on 19/09/15.
 */

var POWER_CONFIG={
  power_content_tpl: _.template($("#power_content_tpl").html()),

  ready_init:function(){
    var self=this;
    self.load_group();
  },

  load_group:function(){
    var self=this;
    var group=$.cookie("group");
    if($.cookie("group")){
      $(".power_nav#"+group+"_nav").addClass("active").siblings().removeClass("active");
    }
    else{
      $(".power_nav:first").addClass("active").siblings().removeClass("active");
    }
    self.power_content_show();
  },

  power_content_show:function(page,event){
    var self=POWER_CONFIG;
    var group=$(".power_nav.active").data("group");
    var $power_box=$(".power_content_box");
    $power_box.empty();
    G_FUNCS.ajax_get($power_box,{group:group},function(data){
      if(data.stat ==="success"){
        if(data.data.length === 0){
          if(group === "partner_dispatcher"){
            $power_box.append($("<div class='no_infor'>暂无调度员信息</div>"));
          }
          else if(group === "partner_admin"){
            $power_box.append($("<div class='no_infor'>暂无管理员信息</div>"));
          }
          else if(group === "partner_super"){
            $power_box.append($("<div class='no_infor'>暂无超级管理员成信息</div>"));
          }
          else if(group === "partner_accountant"){
            $power_box.append($("<div class='no_infor'>暂无财务人员信息</div>"));
          }
        }
        _.each(data.data,function(datas){
          var $power_content_tpl=$($.trim(self.power_content_tpl(datas)));
          $power_box.append($power_content_tpl);
        });
        G_FUNCS.pagenation($(".power_page_box"),data.pages, data.page, self.power_content_show);
      }
    });
  },

  new_dispatch_click:function(){
    var $modal=$("#new_dispatch_modal");
    $modal.modal("show");
    var group_active=$(".power_nav.active").data("group");
    $modal.find(".group").val(group_active);
  },

  power_nav:function($obj){
    var self=this;
    var group=$obj.data("group");
    $obj.addClass("active").siblings().removeClass("active");
    $.cookie("group",group);
    self.load_group();
    
  },

  new_dispatch_form:function($obj){
    var self=this;
    var group_active=$(".power_nav.active").data("group");
    G_FUNCS.ajax_post($obj,function(data){
      if(data.stat==="success"){
        $obj.kz_clear();
        $obj.closest(".modal").modal("hide");
        if(group_active=="partner_dispatcher"){
          alertify.success("添加调度员成功");
        }
        else if(group_active=="partner_admin"){
          alertify.success("添加管理员成功");
        }
        else if(group_active=="partner_super"){
          alertify.success("添加超级管理员成功");
        }
        else if(group_active=="partner_accountant"){
          alertify.success("添加财务人员成功");
        }
        G_FUNCS.reload();
      }
    });
  }
};

$(function(){
  POWER_CONFIG.ready_init();
}).on("click",".new_dispatch_click",function(){
  POWER_CONFIG.new_dispatch_click();
}).on("submit",".new_dispatch_form",function(){
  POWER_CONFIG.new_dispatch_form($(this));
  return false;
}).on("click",".power_nav",function(){
  POWER_CONFIG.power_nav($(this));
})
;