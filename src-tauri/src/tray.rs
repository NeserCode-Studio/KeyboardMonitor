use tauri::Manager;
use tauri::{
    AppHandle, CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};

// 托盘菜单
pub fn menu() -> SystemTray {
    let tray_menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("open_log".to_string(), "启用日志"))
        .add_item(CustomMenuItem::new("close_log".to_string(), "禁用日志"))
        .add_item(CustomMenuItem::new("show_log".to_string(), "查看日志")) // 显示应用日志
        .add_native_item(SystemTrayMenuItem::Separator) // 分割线
        .add_item(CustomMenuItem::new("hide".to_string(), "隐藏")) // 隐藏应用窗口
        .add_item(CustomMenuItem::new("show".to_string(), "显示")) // 显示应用窗口
        .add_native_item(SystemTrayMenuItem::Separator) // 分割线
        .add_item(CustomMenuItem::new("quit".to_string(), "退出")); // 退出

    // 设置在右键单击系统托盘时显示菜单
    SystemTray::new().with_menu(tray_menu)
}

// 菜单事件
pub fn handler(app: &AppHandle, event: SystemTrayEvent) {
    // 获取应用窗口
    let window = app.get_window("main").unwrap();
    // 匹配点击事件
    match event {
        // 根据菜单 id 进行事件匹配
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "quit" => {
                std::process::exit(0);
            }
            "show" => {
                window.show().unwrap();
            }
            "hide" => {
                window.hide().unwrap();
            }
            "show_log" => {
                let _ = window.emit("show-log", "");
            }
            "open_log" => {
                let _ = window.emit("open-log", "");
            }
            "close_log" => {
                let _ = window.emit("close-log", "");
            }
            _ => {}
        },
        _ => {}
    }
}
