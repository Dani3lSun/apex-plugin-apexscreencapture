/*-------------------------------------
 * APEX Screen Capture functions
 * Version: 1.2 (29.12.2015)
 * Author:  Daniel Hochleitner
 *-------------------------------------
*/
FUNCTION render_screencapture(p_dynamic_action IN apex_plugin.t_dynamic_action,
                              p_plugin         IN apex_plugin.t_plugin)
  RETURN apex_plugin.t_dynamic_action_render_result IS
  --
  -- plugin attributes
  l_result           apex_plugin.t_dynamic_action_render_result;
  l_html_elem        VARCHAR2(200) := p_dynamic_action.attribute_01;
  l_open_window      VARCHAR2(10) := p_dynamic_action.attribute_02;
  l_item_name        VARCHAR2(100) := p_dynamic_action.attribute_03;
  l_background       VARCHAR2(10) := p_dynamic_action.attribute_04;
  l_width            NUMBER := p_dynamic_action.attribute_05;
  l_height           NUMBER := p_dynamic_action.attribute_06;
  l_letter_rendering VARCHAR2(50) := p_dynamic_action.attribute_07;
  l_allow_taint      VARCHAR2(50) := p_dynamic_action.attribute_08;
  l_logging          VARCHAR2(50) := p_dynamic_action.attribute_09;
  l_dom_selector     VARCHAR2(50) := p_dynamic_action.attribute_10;
  --
BEGIN
  -- Debug
  IF apex_application.g_debug THEN
    apex_plugin_util.debug_dynamic_action(p_plugin         => p_plugin,
                                          p_dynamic_action => p_dynamic_action);
  END IF;
  --
  -- add html2canvas js / screencapture js / jquery dom outline js (and promise for older browsers)
  apex_javascript.add_library(p_name           => 'es6-promise.min',
                              p_directory      => p_plugin.file_prefix,
                              p_version        => NULL,
                              p_skip_extension => FALSE);

  --
  apex_javascript.add_library(p_name           => 'html2canvas.min',
                              p_directory      => p_plugin.file_prefix,
                              p_version        => NULL,
                              p_skip_extension => FALSE);
  -- only when Dom selector is enabled
  IF l_dom_selector = 'Y' THEN
    apex_javascript.add_library(p_name           => 'jquery.dom-outline-1.0',
                                p_directory      => p_plugin.file_prefix,
                                p_version        => NULL,
                                p_skip_extension => FALSE);
  END IF;
  --
  apex_javascript.add_library(p_name           => 'apexscreencapture',
                              p_directory      => p_plugin.file_prefix,
                              p_version        => NULL,
                              p_skip_extension => FALSE);
  --
  l_result.javascript_function := 'captureScreen';
  l_result.attribute_01        := l_html_elem;
  l_result.attribute_02        := l_open_window;
  l_result.attribute_03        := l_item_name;
  l_result.attribute_04        := l_background;
  l_result.attribute_05        := l_width;
  l_result.attribute_06        := l_height;
  l_result.attribute_07        := l_letter_rendering;
  l_result.attribute_08        := l_allow_taint;
  l_result.attribute_09        := l_logging;
  l_result.attribute_10        := l_dom_selector;
  --
  RETURN l_result;
  --
END render_screencapture;