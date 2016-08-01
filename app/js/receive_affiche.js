var FUNC = {
    _content_tpl: _.template($('#content_tpl').html()),
    $content_container: $('#content_container'),
    $page_box: $('#page_box'),

    read_broadcast: function(data) {
        var self=this;
        var url=$("tr").attr("url");
        var obj_ids = _.map(data, function(i) { return i.id; });
        $.getJSON(url, {obj_ids: obj_ids}, function(data) {});
    },

    query_broadcast: function(page, event) {
        var self = FUNC;

        G_FUNCS.ajax_get(self.$content_container, {
            page: page
        }, function(data) {
            if(data.stat === 'success') {
                self.$content_container.html(self._content_tpl({data: data}));
                G_FUNCS.pagenation(
                    self.$page_box,
                    data.pages,
                    data.page,
                    self.query_broadcast
                );
            }
        });
    },

    affiche_box_line:function($obj){
        var self=this;
        var id=$obj.attr("id");
        var url=$obj.attr("url");
        var hasclass=$obj.hasClass("new_status");
        if(hasclass){
            $.getJSON(url, {obj_ids: [id]}, function(data) {
                if(data.stat === "success"){
                    $obj.removeClass("new_status");
                    var notice_num=$("#notice_nav_notice").text();
                    var receive_num=$("#receive_num").text();
                    if(notice_num !=="" && notice_num !== "99+" ){
                        var read_num=parseInt(notice_num)-1;
                        if(read_num === 0){
                            read_num="";
                        }
                        $("#notice_nav_notice").text(read_num);

                    }
                    if(receive_num !== "" && receive_num !==  "99+" ){
                        var read_receive_num=parseInt(receive_num)-1;
                        if(read_receive_num === 0){
                            read_receive_num="";
                            $("#receive_num").closest(".notice_receive_parent").css("display","none");

                        }
                        $("#receive_num").text(read_receive_num);

                    }
                }
            });
        }
    },

    ready_init: function() {
        var self = this;
        self.query_broadcast();
    },

    affiche_detail_click:function($obj){
        var self=this;
        var $modal=$("#affiche_detail_modal");
        var data_detail=$obj.data("detail");
        $modal.find(".modal-title").html(data_detail.title);
        $modal.find(".create_time_text").html(data_detail.create_time);
        $modal.find(".content_text").html(data_detail.content);
        self.affiche_box_line($obj.closest(".affiche_box_line"));
        $modal.modal("show");
    }
};

$(function(){
    FUNC.ready_init();
}).on("click",".affiche_detail_click",function(){
    FUNC.affiche_detail_click($(this));
})
;
