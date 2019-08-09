export interface <%= classify(name) %> {
  <% Object.keys(properties).forEach(function(parameter) { %><%= parameter %>: <%= properties[parameter] %>;
  <%})%>
}