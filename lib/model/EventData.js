export var EventData;
(function (EventData) {
    let Type;
    (function (Type) {
        Type["inPerson"] = "in_person";
        Type["online"] = "online";
    })(Type = EventData.Type || (EventData.Type = {}));
    let Frequency;
    (function (Frequency) {
        Frequency["once"] = "once";
        Frequency["daily"] = "daily";
        Frequency["weekly"] = "weekly";
        Frequency["monthly"] = "monthly";
    })(Frequency = EventData.Frequency || (EventData.Frequency = {}));
    let Status;
    (function (Status) {
        Status["draft"] = "draft";
        Status["scheduled"] = "scheduled";
        Status["active"] = "active";
        Status["archived"] = "archived";
    })(Status = EventData.Status || (EventData.Status = {}));
})(EventData || (EventData = {}));
